const app = new Vue({
    el: "#app",
    template: `
    <main>
        <header>
            <h1>{{ projName }}</h1>
        </header>
        <section>
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
    </main>
    `,

    data: () => ({
        projName: "~/Projects/Rust/cargo-gui",
        customCmd: "",
        releaseBuild: false,
    }),

    methods: {
        submitCustomCmd() {
            this.runCmd(this.customCmd);
        },

        cargoCmd(cmd) {
            const opts = [
                ...(this.releaseBuild ? [`--release`] : []),
            ].join(" ");
            this.runCmd(`cargo ${cmd} ${opts}`.trim())
        },

        runCmd(cmd) {
            console.log(`Running \`\$ ${cmd}\`...`);
            fetch("/api", {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json"}),
                body: JSON.stringify({ cmd })
            }).then(res => res.text())
            .then(text => {
                console.log("Got this back from the server: ", text);
            });
        }
    },
});