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
            :cmdRunning="cmdRunning"
        />

        <loading-indicator
            v-if="cmdRunning"
            @cancel="cancelCmd"
        />

        <response-window
            v-if="cmdRunning || cmdStatus !== null"
            :cmdStatus="cmdStatus"
            :stdoutLines="stdoutLines"
            :stderrLines="stderrLines"
            :lastCmd="mostRecentCmd"
            ref="responseWindow"
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
    stdoutLines: null,
    stderrLines: null,
    stdoutLinesDone: true,
    stderrLinesDone: true,
    history: []
  }),

  mounted() {
    fetch("/api/project_config")
      .then(resp => resp.json())
      .then(json => (this.projectConfig = json));
  },

  computed: {
    mostRecentCmd() {
      return this.history[this.history.length - 1];
    },

    cmdRunning() {
      return !this.stdoutLinesDone || !this.stderrLinesDone;
    }
  },

  methods: {
    customCmd(cmd) {
      console.log(`attempting to run \`\$ ${cmd}\`...`);
      this.cmdResponse = "i don't know how to run custom cmds yet, srry";
      this.history.push(cmd);
    },

    resetCmd() {
      this.cmdStatus = null;
      this.stdoutLines = [];
      this.stderrLines = [];
      this.stdoutLinesDone = false;
      this.stderrLinesDone = false;
    },

    cargoCmd([cmd, ...cargoOpts]) {
      const cmdText = `cargo ${cmd} ${cargoOpts.join(" ")}`.trim();
      this.history.push(cmdText);

      // This starts the loading spinner.
      this.resetCmd();

      fetch("/api/cargo", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ cmd, cargoOpts })
      }).then(_resp => {
        // this.cmdStatus = resp.status;
        // if (resp.status === 0) {
        //     // Remove first line, which is a JSON compiler_artifact message.
        //     this.cmdResponse = resp.stdout.split("\n").slice(1).join("\n");
        //     this.errors = null;
        // } else {
        //     this.displayCompilerError(resp.stdout);
        // }
        this.readNextLine("stdout");
        this.readNextLine("stderr");
      });
    },

    readNextLine(stream_name) {
      fetch(`/api/${stream_name}_line`)
        .then(resp => resp.json())
        .then(json => {
          if (json.hasOwnProperty("line")) {
            this[`${stream_name}Lines`].push(json["line"]);
            this.readNextLine(stream_name);
          } else if (json === "end") {
            this[`${stream_name}LinesDone`] = true;
            if (!this.cmdRunning) {
              // Both stdout and stderr have been read to completion. Command is finished.
              this.getStatusCode();
            }
          }
        });
    },

    getStatusCode() {
      fetch("/api/cmd_status")
        .then(resp => resp.json())
        .then(code => {
          this.cmdStatus = code;
          setTimeout(() => {
            this.$refs.responseWindow.checkForIncomingErrors();
          }, 0);
        });
    },

    // displayCompilerError(stdout) {
    //   const ansi_up = new AnsiUp();
    //   this.errors = stdout
    //     .trim()
    //     .split("\n")
    //     .map(JSON.parse)
    //     .filter(err => {
    //       return (
    //         // Skip dependency build messages. Only keep errors.
    //         err.reason &&
    //         err.reason === "compiler-message" &&
    //         // Skip these specfic messages.
    //         err.message &&
    //         !err.message.message.startsWith("aborting due to") &&
    //         !err.message.message.startsWith(
    //           "For more information about this error, try"
    //         )
    //       );
    //     })
    //     .map(err => {
    //       err.message.rendered = ansi_up.ansi_to_html(err.message.rendered);
    //       return err;
    //     });

    //   // Stop the loading spinner.
    //   this.cmdRunning = false;
    // },

    cancelCmd() {
      console.log("cancelled!");
    }
  },

  components: {
    projectTitle,
    cmdMenu,
    cmdHistory,
    loadingIndicator,
    responseWindow
  }
});
