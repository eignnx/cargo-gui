const responseWindow = Vue.component("response-window", {
  props: [
    "cmdStatus",
    "stdoutLines",
    "stderrLines",
    "lastCmd" // The last command executed.
  ],

  template: `
    <section>
        <div class="row">
            <div class="col">
                <div
                    class="alert alert-danger"
                    role="alert"
                    v-if="errorMessages.length !== 0"
                >
                    <h4 class="alert-heading">Compiler Error!</h4>
                    <p>The command <strong class="text-monospace">{{ lastCmd }}</strong> exited with status code <strong class="text-monospace">{{ cmdStatus }}</strong>, and there are <strong class="text-monospace">{{ errorMessages.length }}</strong> errors!</p>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col">
                <pagination-nav
                    ariaLabel="Compilation Errors Navigator"
                    :itemCount="errorMessages.length"
                    v-model="currentErrorIdx"
                />
            </div>
        </div>

        <div class="row">
          <div class="col">
            <pre
              class="terminal-output"
              v-html="currentErrorMessage"
            ></pre>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <h3>Compiler Artifacts</h3>
            <pre
              class="terminal-output"
              v-html="compilerArtifacts"
            ></pre>
          </div>
        </div>

    </section>
    `,

  data: () => ({
    currentErrorIdx: 0
  }),

  computed: {
    currentErrorMessage() {
      return this.errorMessages[this.currentErrorIdx];
    },

    errorMessages() {
      return this.stderrLines
        .map(safeJsonParse)
        .filter(json => json.reason === "compiler-message")
        .map(cleanJsonMessage);
    },

    compilerArtifacts() {
      return this.stdoutLines
        .map(safeJsonParse)
        .filter(msg => msg.reason === "compiler-artifact")
        .map(msg => `  Compiling ${msg.package_id}`)
        .join("\n");
    }
  },

  components: {
    paginationNav
  }
});

const ansi_up = new AnsiUp();

function cleanJsonMessage(json) {
  const rendered = json.message.rendered;
  const html_str = ansi_up.ansi_to_html(rendered);
  const trimmed = html_str.trim(); // Remove trailing '\n'.
  return trimmed;
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.err("JSON PARSE ERROR:", e, str);
  }
}
