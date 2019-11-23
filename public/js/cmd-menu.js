const cmdMenu = Vue.component("cmd-menu", {
    template: `
    <section>
        <div class="form-inline mb-4">
            <button
                class="btn btn-outline-danger btn-lg mr-2"
                @click="cargoCmd('run')"
            >▶ Run</button>
            <button
                class="btn btn-outline-primary btn-lg mr-2"
                @click="cargoCmd('build')"
            >🔨 Build</button>
            <button
                class="btn btn-outline-success btn-lg mr-2"
                @click="cargoCmd('test')"
            >🧪 Test</button>
            <button
                class="btn btn-outline-info btn-lg mr-2"
                @click="cargoCmd('check')"
            >✔️ Check</button>
            
            <span class="input-group input-group-lg mr-2">
                <span class="input-group-prepend">
                    <span class="input-group-text" id="custom-cmd-label">$</span>
                </span>
                <input
                    type="text"
                    class="form-control"
                    placeholder="Custom cmd..."
                    aria-label="custom command" 
                    aria-describedby="custom-cmd-label"
                    v-model="customCmd"
                    @keyup.enter="submitCustomCmd"
                >
                <span class="input-group-append">
                    <button class="btn btn-outline-danger" @click="submitCustomCmd">▶ Exec</button>
                </span>
            </span>

            <button
                class="btn btn-outline-secondary btn-lg mr-2"
                type="button"
                data-toggle="collapse"
                data-target="#options-panel"
                aria-expanded="false"
                aria-controls="options-panel"
            >⯆ Options</button>
        </div>

        <div class="collapse" id="options-panel">
            <div class="card card-body">
                <div class="form-check form-check-inline mb-4">
                    <input
                        type="checkbox"
                        class="form-check-input"
                        id="release-checkbox"
                        v-model="releaseBuild"
                    />
                    <label class="form-check-label" for="release-checkbox">Release Build?</label>
                </div>
            </div>
        </div>
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