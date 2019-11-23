const responseWindow = Vue.component("response-window", {
    props: [
        "cmdStatus",
        "cmdResponse",
        "compilerErrors",
    ],

    template: `
    <section>
        <div class="row">
            <div class="col">
                <h4>Status code: {{ cmdStatus }}</h4>
                <h4 v-if="compilerErrors !== null">Errors: {{ compilerErrors.length }}</h4>
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