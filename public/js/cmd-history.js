const cmdHistory = Vue.component("cmd-history", {
    props: ["history"],
    template: `
    <section>
        <details>
            <summary>Command History</summary>
            <pre class="terminal-output"><div v-for="cmd in history">{{ "$ " + cmd }}</div></pre>
        </details>
    </section>
    `,
});