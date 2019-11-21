const cmdMenu = Vue.component("cmd-menu", {
    template: `
    <section>
        <button @click="cargoCmd('run')">▶ Run</button>
        <button @click="cargoCmd('build')">🔨 Build</button>
        <button @click="cargoCmd('test')">🧪 Test</button>
        <button @click="cargoCmd('check')">✔️ Check</button>
        <input
            type="text"
            placeholder="Custom cmd..."
            v-model="customCmd"
            @keyup.enter="submitCustomCmd"
        />
        <br>
        <span>
            <label for="release-checkbox">Release Build?</label>
            <input
                type="checkbox"
                id="release-checkbox"
                v-model="releaseBuild"
            />
        </span>
    </section>
    `,

    data: () => ({
        customCmd: "",
        releaseBuild: false,
    }),

    methods: {
        cargoCmd(cmd) {
            const cargoOpts = [
                ...(this.releaseBuild ? [`--release`] : []),
            ];

            this.$emit("cargo-cmd", [cmd, ...cargoOpts]);
        },

        submitCustomCmd() {
            this.$emit("custom-cmd", this.customCmd)
            this.customCmd = "";
        },
    },
});