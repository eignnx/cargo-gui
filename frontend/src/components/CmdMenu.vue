<template>
  <section>
    <div class="row">
      <div class="col form-inline mb-4">
        <button
          class="btn btn-outline-danger btn-lg m-2"
          @click="cargoCmd('run')"
          aria-label="Run"
          :disabled="cmdRunning || true"
        >
          <span aria-hidden="true">▶ Run</span>
        </button>
        <button
          class="btn btn-outline-primary btn-lg m-2"
          @click="cargoCmd('build')"
          aria-label="Build"
          :disabled="cmdRunning"
        >
          <span aria-hidden="true">🔨 Build</span>
        </button>
        <button
          class="btn btn-outline-success btn-lg m-2"
          @click="cargoCmd('test')"
          aria-label="Test"
          :disabled="cmdRunning || true"
        >
          <span aria-hidden="true">🧪 Test</span>
        </button>
        <button
          class="btn btn-outline-info btn-lg m-2"
          @click="cargoCmd('check')"
          aria-label="Check"
          :disabled="cmdRunning"
        >
          <span aria-hidden="true">✔️ Check</span>
        </button>

        <span class="input-group input-group-lg m-2">
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
          />
          <span class="input-group-append">
            <button
              class="btn btn-outline-danger"
              @click="submitCustomCmd"
              aria-label="Execute"
              :disabled="cmdRunning || true"
            >
              <span aria-hidden="true">▶ Exec</span>
            </button>
          </span>
        </span>

        <button
          class="btn btn-outline-secondary btn-lg m-2"
          type="button"
          data-toggle="collapse"
          data-target="#options-panel"
          aria-expanded="false"
          aria-controls="options-panel"
          aria-label="Options"
        >
          <span aria-hidden="true">⯆ Options</span>
        </button>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col">
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
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "cmd-menu",

  props: {
    cmdRunning: Boolean
  },

  data: () => ({
    customCmd: "",
    releaseBuild: false
  }),

  methods: {
    cargoCmd(cmd) {
      const cargoOpts = [...(this.releaseBuild ? [`--release`] : [])];

      this.$emit("cargo-cmd", [cmd, ...cargoOpts]);
    },

    submitCustomCmd() {
      this.$emit("custom-cmd", this.customCmd);
      this.customCmd = "";
    }
  }
};
</script>

<style lang="scss">
</style>