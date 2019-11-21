const responseWindow = Vue.component("response-window", {
    props: [
        "cmdStatus",
        "cmdResponse",
        "compilerErrors",
    ],

    template: `
    <section>
        <h4>Status code: {{ cmdStatus }}</h4>
        <h4 v-if="compilerErrors !== null">Errors: {{ compilerErrors.length }}</h4>
        <pre
            class="terminal-output"
            v-if="compilerErrors !== null"
            v-for="err in compilerErrors"
        >{{ err.message.rendered }}</pre>
        <pre
            class="terminal-output"
            v-if="compilerErrors === null"
        >{{ cmdResponse }}</pre>
    </section>
    `,
});