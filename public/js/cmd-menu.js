const cmdMenu = Vue.component("cmd-menu", {
    template: `
    <section class="container">
        <div class="form-inline mb-4">
            <button
                class="btn btn-outline-danger btn-lg m-1"
                @click="cargoCmd('run')"
            >▶ Run</button>
            <button
                class="btn btn-outline-primary btn-lg m-1"
                @click="cargoCmd('build')"
            >🔨 Build</button>
            <button
                class="btn btn-outline-success btn-lg m-1"
                @click="cargoCmd('test')"
            >🧪 Test</button>
            <button
                class="btn btn-outline-info btn-lg m-1"
                @click="cargoCmd('check')"
            >✔️ Check</button>
            
            <span class="input-group input-group-lg m-1">
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
        </div>

        <div class="form-check form-check-inline mb-4">
            <input
                type="checkbox"
                class="form-check-input"
                id="release-checkbox"
                v-model="releaseBuild"
            />
            <label class="form-check-label" for="release-checkbox">Release Build?</label>
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