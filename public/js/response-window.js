const responseWindow = Vue.component("response-window", {
    props: [
        "cmdStatus",
        "cmdResponse",
        "compilerErrors",
        "lastCmd", // The last command executed.
    ],

    template: `
    <section>
        <div class="row">
            <div class="col">
                <div
                    class="alert alert-danger"
                    role="alert"
                    v-if="compilerErrors !== null"
                >
                    <h4 class="alert-heading">Compiler Error!</h4>
                    <p>The command <strong class="text-monospace">{{ lastCmd }}</strong> exited with status code <strong class="text-monospace">{{ cmdStatus }}</strong>, and there are <strong class="text-monospace">{{ compilerErrors.length }}</strong> errors!</p>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col">
                <pagination-nav
                    ariaLabel="Compilation Errors Navigator"
                    v-if="compilerErrors !== null && compilerErrors !== []"
                    :itemCount="compilerErrors.length"
                    v-model="currentErrorIdx"
                />
            </div>
        </div>

        <div class="row">
            <div class="col">
                <pre
                    class="terminal-output"
                    v-if="compilerErrors !== null && compilerErrors !== []"
                    v-html="currentErrorMessage"
                ></pre>

                <pre
                    class="terminal-output"
                    v-if="compilerErrors === null || compilerErrors === []"
                >{{ cmdResponse }}</pre>
            </div>
        </div>

    </section>
    `,

    data: () => ({
        currentErrorIdx: 0,
    }),

    computed: {
        currentErrorMessage() {
            return this.compilerErrors[this.currentErrorIdx].message.rendered;
        },
    },

    components: {
        paginationNav,
    },
});