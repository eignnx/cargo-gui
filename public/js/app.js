const app = new Vue({
    el: "#app",
    template: `
    <main class="container-fluid">
        <project-title
            :title="projectConfig ? projectConfig.path : '...'"
        />
        <cmd-menu
            @cargo-cmd="cargoCmd"
            @custom-cmd="customCmd"
        />
        <hr>
        <cmd-history
            :history="history"
        />

        <response-window
            :cmdStatus="cmdStatus"
            :cmdResponse="cmdResponse"
            :compilerErrors="errors"
        />
    </main>
    `,

    data: () => ({
        projectConfig: null,
        releaseBuild: false,
        cmdStatus: "",
        cmdResponse: "",
        history: [],
        errors: null,
    }),

    mounted() {
        fetch("/api/project_config")
            .then(resp => resp.json())
            .then(json => { console.log(json); this.projectConfig = json; });
    },

    methods: {
        customCmd(cmd) {
            console.log(`attempting to run \`\$ ${cmd}\`...`);
            this.cmdResponse = "i don't know how to run custom cmds yet, srry";
            this.history.push(cmd);
        },

        cargoCmd([cmd, ...cargoOpts]) {

            // Reset the command status.
            this.cmdStatus = "...";

            // Display status while command executes.
            const cmdText = `cargo ${cmd} ${cargoOpts.join(" ")}`.trim();
            this.cmdResponse = `Running \`\$ ${cmdText}\`...`;
            this.history.push(cmdText);

            this.errors = [];

            fetch("/api/cargo", {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json"}),
                body: JSON.stringify({ cmd, cargoOpts })
            })
                .then(resp => resp.json())
                .then(resp => {
                    this.cmdStatus = resp.status;
                    if (resp.status === 0) {
                        // Remove first line, which is a JSON compiler_artifact message.
                        this.cmdResponse = resp.stdout.split("\n").slice(1).join("\n");
                        this.errors = null;
                    } else {
                        this.displayCompilerError(resp.stdout);
                    }
                });
        },

        displayCompilerError(stdout) {
            this.errors = stdout
                .trim()
                .split("\n")
                .map(JSON.parse)
                .map(x => { console.log(x); return x })
                .filter(err => {
                    return err.message.message !== "aborting due to previous error"
                        && !err.message.message.startsWith("For more information about this error, try");
                });
        },
    },

    components: {
        projectTitle,
        cmdMenu,
        cmdHistory,
        responseWindow,
    }
});