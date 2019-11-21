const app = new Vue({
    el: "#app",
    template: `
    <main>
        <header>
            <h1>{{ projName }}</h1>
        </header>
        <section>
            <button @click="cargoCmd('run')">Run ▶️</button>
            <button @click="cargoCmd('build')">Build 🔨</button>
            <button @click="cargoCmd('test')">Test 🧪</button>
            <button @click="cargoCmd('check')">Check ✔️</button>
            <input
                type="text"
                placeholder="Custom cmd..."
                v-model="customCmd"
                @keyup.enter="submitCustomCmd"
            />
            <span>
                <label for="release-checkbox">Release Build?</label>
                <input type="checkbox" id="release-checkbox" v-model="releaseBuild"/>
            </span>
        </section>
        You entered: {{ customCmd }} <br>
        Release build: {{ releaseBuild }} <br>
        <section>
            {{ cmdResponse }}
        </section>
    </main>
    `,

    data: () => ({
        projName: "~/Projects/Rust/cargo-gui",
        customCmd: "",
        releaseBuild: false,
        cmdResponse: "",
    }),

    methods: {
        submitCustomCmd() {
            this.runCmd(this.customCmd);
        },

        cargoCmd(cmd) {
            const cargoOpts = [
                ...(this.releaseBuild ? [`--release`] : []),
            ];

            this.cmdResponse = `Running \`\$ cargo ${cmd} ${cargoOpts.join(" ")}\`...`;

            fetch("/api/cargo", {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json"}),
                body: JSON.stringify({ cmd, cargoOpts })
            })
                .then(res => res.text())
                .then(text => {
                    console.log("Resp: ", text);
                    this.cmdResponse = text;
                });
        },

        runCmd(cmd) {
            console.log("unsupported!");
        }
    },
});