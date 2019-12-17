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

          <div
              class="alert alert-success"
              role="alert"
              v-if="cmdStatus !== null && errorMessages.length === 0"
          >
              <h4 class="alert-heading">Success!</h4>
              <p>The command <strong class="text-monospace">{{ lastCmd }}</strong> exited successfully with status code <strong class="text-monospace">{{ cmdStatus }}</strong>.</p>
          </div>
      </div>
  </div>

  <div class="row">
    <div class="col">
      <nav class="mb-4">
        <div class="nav nav-tabs" id="compiler-output-tabs" role="tablist">
          <a
            id="compiler-messages-tab"
            :class="compilerMessagesTabClasses"
            @click="currentTab = 'compiler-messages'"
            href="#compiler-messages-panel"
            data-toggle="tab"
            role="tab"
            aria-controls="compiler-messages-panel"
            :aria-selected="currentTab === 'compiler-messages'"
          >Compiler Messages <span class="badge badge-primary">{{ compilerMessages.length }}</span></a>
          <a
            id="compiler-errors-tab"
            :class="compilerErrorsTabClasses"
            @click="currentTab = 'compiler-errors'"
            href="#compiler-errors-panel"
            data-toggle="tab"
            role="tab"
            aria-controls="compiler-error-panel"
            :aria-selected="currentTab === 'compiler-errors'"
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
          :class="compilerMessagesPanelClasses"
          id="compiler-messages-panel"
          role="tabpanel"
          aria-labelledby="compiler-messages-tab"
        >

          <div class="row">
            <div class="col">
              <h3>Compiler Messages</h3>
              <pre
                class="terminal-output"
                v-html="compilerMessages.join('\\n')"
              ></pre>
            </div>
          </div>

        </div>
        <div
          :class="compilerErrorsPanelClasses"
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
    currentErrorIdx: 0,
    currentTab: "compiler-messages"
  }),

  computed: {
    currentErrorMessage() {
      return this.errorMessages[this.currentErrorIdx];
    },

    errorMessages() {
      return this.stdoutLines
        .filter(line => !abortRegex.test(line))
        .filter(line => !explainRegex.test(line))
        .map(safeJsonParse)
        .filter(json => json.reason === "compiler-message")
        .map(cleanJsonMessage);
    },

    // TODO: Display this info to user somehow (not as one of the `errorMessages`).
    cargoCmdAborted() {
      return this.stdoutLines.some(line => abortRegex.test(line));
    },

    // TODO: Display this info to user somehow (not as one of the `errorMessages`).
    cargoCmdExplained() {
      return this.stdoutLines.some(line => explainRegex.test(line));
    },

    compilerMessages() {
      return this.stderrLines;
    },

    compilerMessagesTabClasses() {
      return {
        "nav-item": true,
        "nav-link": true,
        active: this.currentTab === "compiler-messages"
      };
    },

    compilerErrorsTabClasses() {
      return {
        "nav-item": true,
        "nav-link": true,
        active: this.currentTab === "compiler-errors"
      };
    },

    compilerMessagesPanelClasses() {
      return {
        "tab-pane": true,
        fade: true,
        show: this.currentTab === "compiler-messages",
        active: this.currentTab === "compiler-messages"
      };
    },

    compilerErrorsPanelClasses() {
      return {
        "tab-pane": true,
        fade: true,
        show: this.currentTab === "compiler-errors",
        active: this.currentTab === "compiler-errors"
      };
    }
  },

  methods: {
    checkForIncomingErrors() {
      if (this.errorMessages !== null && this.errorMessages.length !== 0) {
        this.currentTab = "compiler-errors";
      }
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
    console.log(str);
    console.error("JSON PARSE ERROR:", e, str);
  }
}

const abortRegex = /.*aborting due to \d+ previous error(s?).*$/;
const explainRegex = /For more information about this error, try `rustc --explain E\d+`./;
