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
    <nav>
      <div class="nav nav-tabs" id="compiler-output-tabs" role="tablist">
        <a
          class="nav-item nav-link active"
          id="compiler-messages-tab"
          data-toggle="tab"
          href="#compiler-messages-panel"
          role="tab"
          aria-controls="compiler-messages-panel"
          aria-selected="true"
        >Compiler Messages <span class="badge badge-primary">{{ compilerArtifacts.length }}</span></a>
        <a
          class="nav-item nav-link"
          id="compiler-errors-tab"
          data-toggle="tab"
          href="#compiler-errors-panel"
          role="tab"
          aria-controls="compiler-error-panel"
          aria-selected="false"
        >Compiler Errors
          <span
            class="badge badge-danger"
            v-if="errorMessages.length !== 0"
          >{{ errorMessages.length }}</span>
        </a>
      </div>
    </nav>

    <div class="tab-content" id="compiler-output-panels">
      <div
        class="tab-pane fade show active"
        id="compiler-messages-panel"
        role="tabpanel"
        aria-labelledby="compiler-messages-tab"
      >

        <div class="row">
          <div class="col">
            <h3>Compiler Artifacts</h3>
            <pre
              class="terminal-output"
              v-html="compilerArtifacts.join('\\n')"
            ></pre>
          </div>
        </div>

      </div>
      <div
        class="tab-pane fade"
        id="compiler-errors-panel"
        role="tabpanel"
        aria-labelledby="compiler-errors-tab"
      >

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

      </div>
    </div>
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
      const err_lines = this.stdoutLines.concat(this.stderrLines);
      return err_lines
        .map(safeJsonParse)
        .filter(json => json.reason === "compiler-message")
        .map(cleanJsonMessage);
    },

    compilerArtifacts() {
      return this.stdoutLines.map(safeJsonParse).flatMap(msg => {
        // TODO: Revisit this. Research actual `reason`s, print + format like
        // `rustc`.
        if (msg.reason === "compiler-artifact") {
          return [`  Compiling ${msg.package_id}`];
        } else if (msg.reason === "build-script-executed") {
          return [`   Building ${msg.package_id}`];
        } else {
          return [];
        }
      });
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
