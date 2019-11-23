const app = new Vue({
    el: "#app",
    template: `
    <main class="container">
        <project-title
            :title="projectConfig ? projectConfig.title : '...'"
            :path="projectConfig ? projectConfig.path : '...'"
        />

        <cmd-menu
            @cargo-cmd="cargoCmd"
            @custom-cmd="customCmd"
        />

        <response-window
            v-if="cmdStatus !== null || cmdResponse !== null"
            :cmdStatus="cmdStatus"
            :cmdResponse="cmdResponse"
            :compilerErrors="errors"
        />

        <cmd-history
            :history="history"
        />
    </main>
    `,

    data: () => ({
        projectConfig: null,
        releaseBuild: false,
        cmdStatus: null,
        cmdResponse: null,
        errors: null,
        history: [],
    }),

    mounted() {
        fetch("/api/project_config")
            .then(resp => resp.json())
            .then(json => this.projectConfig = json);
    },

    methods: {
        customCmd(cmd) {
            console.log(`attempting to run \`\$ ${cmd}\`...`);
            this.cmdResponse = "i don't know how to run custom cmds yet, srry";
            this.history.push(cmd);
        },

        cargoCmd([cmd, ...cargoOpts]) {

            // Reset the command response, status, and errors.
            this.cmdResponse = null;
            this.cmdStatus = null;
            this.errors = null;

            const cmdText = `cargo ${cmd} ${cargoOpts.join(" ")}`.trim();
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
                        // Remove first line, which is a JSON compiler_artifact message.
                        this.cmdResponse = resp.stdout.split("\n").slice(1).join("\n");
                        this.errors = null;
                    } else {
                        this.displayCompilerError(resp.stdout);
                    }
                });
        },

        displayCompilerError(stdout) {
            const ansi_up = new AnsiUp;

            this.errors = stdout
                .trim()
                .split("\n")
                .map(JSON.parse)
                .filter(err => {
                    return (
                        // Skip dependency build messages. Only keep errors.
                        err.reason
                        && err.reason === "compiler-message"

                        // Skip these specfic messages.
                        && err.message
                        && !err.message.message.startsWith("aborting due to")
                        && !err.message.message.startsWith("For more information about this error, try")
                    );
                })
                .map(err => {
                    err.message.rendered = ansi_up.ansi_to_html(err.message.rendered);
                    return err;
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