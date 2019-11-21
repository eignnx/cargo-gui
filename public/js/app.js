const app = new Vue({
    el: "#app",
    template: `
    <main>
        <header>
            <h1>{{ projectConfig ? projectConfig.path : "..." }}</h1>
        </header>
        <section>
            <button @click="cargoCmd('run')">▶ Run</button>
            <button @click="cargoCmd('build')">🔨 Build</button>
            <button @click="cargoCmd('test')">🧪 Test</button>
            <button @click="cargoCmd('check')">✔️ Check</button>
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
            <h5>Status code: {{ cmdStatus }}</h5>
            {{ cmdResponse }}
        </section>
    </main>
    `,

    data: () => ({
        projectConfig: null,
        customCmd: "",
        releaseBuild: false,
        cmdStatus: "",
        cmdResponse: "",
    }),

    mounted() {
        fetch("/api/project_config")
            .then(resp => resp.json())
            .then(json => { console.log(json); this.projectConfig = json; });
    },

    methods: {
        submitCustomCmd() {
            this.runCmd(this.customCmd);
        },

        cargoCmd(cmd) {
            const cargoOpts = [
                ...(this.releaseBuild ? [`--release`] : []),
            ];

            this.cmdStatus = "";
            this.cmdResponse = `Running \`\$ cargo ${cmd} ${cargoOpts.join(" ")}\`...`;

            fetch("/api/cargo", {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json"}),
                body: JSON.stringify({ cmd, cargoOpts })
            })
                .then(resp => resp.json())
                .then(resp => {
                    this.cmdStatus = resp.status;
                    if (resp.status === 0) {
                        this.cmdResponse = resp.stdout;
                    } else {
                        this.cmdResponse = resp.stderr;
                    }
                });
        },

        runCmd(cmd) {
            console.log("unsupported!");
            this.cmdResponse = "i don't know how to run custom cmds yet, srry";
        }
    },
});