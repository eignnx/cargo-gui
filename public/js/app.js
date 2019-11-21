const app = new Vue({
    el: "#app",
    template: `
    <main>
        <header>
            <h1 id="project-title">{{ projectConfig ? projectConfig.path : "..." }}</h1>
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
            <br>
            <span>
                <label for="release-checkbox">Release Build?</label>
                <input type="checkbox" id="release-checkbox" v-model="releaseBuild"/>
            </span>
        </section>

        <hr>

        <section>
            <details>
                <summary>Command History</summary>
                <pre  class="terminal-output"><div v-for="cmd in history">{{ "$ " + cmd }}</div></pre>
            </details>
        </section>

        <section>
            <h5>Status code: {{ cmdStatus }}</h5>
            <pre class="terminal-output">{{ cmdResponse }}</pre>
        </section>
    </main>
    `,

    data: () => ({
        projectConfig: null,
        customCmd: "",
        releaseBuild: false,
        cmdStatus: "",
        cmdResponse: "",
        history: [],
    }),

    mounted() {
        fetch("/api/project_config")
            .then(resp => resp.json())
            .then(json => { console.log(json); this.projectConfig = json; });
    },

    methods: {
        submitCustomCmd() {
            console.log(`attempting to run \`\$ ${this.customCmd}\`...`);
            this.cmdResponse = "i don't know how to run custom cmds yet, srry";
            this.history.push(this.customCmd);
            this.customCmd = "";
        },

        cargoCmd(cmd) {
            const cargoOpts = [
                ...(this.releaseBuild ? [`--release`] : []),
            ];

            // Reset the command status.
            this.cmdStatus = "...";

            // Display status while command executes.
            const cmdText = `cargo ${cmd} ${cargoOpts.join(" ")}`.trim();
            this.cmdResponse = `Running \`\$ ${cmdText}\`...`;

            this.history.push(cmdText);

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
    },
});