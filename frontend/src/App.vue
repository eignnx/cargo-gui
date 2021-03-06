<template>
  <main id="app" class="container">
    <project-title
      :title="projectConfig ? projectConfig.title : '...'"
      :path="projectConfig ? projectConfig.path : '...'"
    />

    <cmd-menu @cargo-cmd="cargoCmd" @custom-cmd="customCmd" :cmdRunning="cmdRunning" />

    <loading-indicator v-if="cmdRunning" @cancel="cancelCmd" />

    <response-window v-if="cmdRunning || cmdResultsReady" ref="responseWindow" />

    <cmd-history :history="history" />
  </main>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import ProjectTitle from "./components/ProjectTitle.vue";
import CmdMenu from "./components/CmdMenu.vue";
import CmdHistory from "./components/CmdHistory.vue";
import LoadingIndicator from "./components/LoadingIndicator.vue";
import ResponseWindow from "./components/ResponseWindow.vue";

export default {
  name: "app",

  data: () => ({
    projectConfig: null
  }),

  mounted() {
    fetch("/api/project_config")
      .then(resp => resp.json())
      .then(json => (this.projectConfig = json));
  },

  computed: {
    ...mapGetters(["cmdResultsReady"]),
    ...mapState(["cmdRunning", "history"])
  },

  methods: {
    ...mapActions(["runCargoCmd"]),

    customCmd(cmd) {
      // console.log(`attempting to run \`\$ ${cmd}\`...`);
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
      this.runCargoCmd([cmd, ...cargoOpts]).then(status => {
        this.$refs.responseWindow.maybeSwitchToErrorsTab();
      });

      // const cmdText = `cargo ${cmd} ${cargoOpts.join(" ")}`.trim();
      // this.history.push(cmdText);

      // // This starts the loading spinner.
      // this.resetCmd();

      // fetch("/api/cargo", {
      //   method: "POST",
      //   headers: new Headers({ "Content-Type": "application/json" }),
      //   body: JSON.stringify({ cmd, cargoOpts })
      // }).then(_resp => {
      //   // this.cmdStatus = resp.status;
      //   // if (resp.status === 0) {
      //   //     // Remove first line, which is a JSON compiler_artifact message.
      //   //     this.cmdResponse = resp.stdout.split("\n").slice(1).join("\n");
      //   //     this.errors = null;
      //   // } else {
      //   //     this.displayCompilerError(resp.stdout);
      //   // }
      //   this.readNextLine("stdout");
      //   this.readNextLine("stderr");
      // });
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
          // Altering `this.cmdStatus` makes the `response-window` element appear after the state is
          // updated. Once it appears, we need to tell it to check for errors so that the
          // compiler-errors tab can be switched to.
          return defer();
        })
        .then(x => {
          this.$refs.responseWindow.maybeSwitchToErrorsTab();
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
      // console.log("cancelled!");
    }
  },

  components: {
    ProjectTitle,
    CmdMenu,
    CmdHistory,
    LoadingIndicator,
    ResponseWindow
  }
};

function defer() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
</script>

<style lang="scss">
</style>
