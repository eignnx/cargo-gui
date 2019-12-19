<template>
  <section class="accordion my-4" id="cmd-history-accordion">
    <div class="card">
      <div class="card-header" id="open-cmd-history-heading">
        <h3>
          <button
            class="btn btn-outline-secondary collapsed"
            type="button"
            data-toggle="collapse"
            data-target="#cmd-history-list"
            aria-expanded="false"
            aria-controls="cmd-history-list"
            arial-label="Command History"
          >
            <span aria-hidden="true">⯆ Command History</span>
          </button>
        </h3>
      </div>

      <div
        id="cmd-history-list"
        class="collapse"
        aria-labelledby="open-cmd-history-heading"
        data-parent="#cmd-history-accordion"
      >
        <div class="card-body">
          <ul class="list-group">
            <li
              class="list-group-item text-light bg-dark text-monospace"
              v-for="(cmd, idx) in history"
              :key="idx"
            >{{ "$ " + cmd }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "cmd-history",
  props: ["history"]
};
</script>

<style lang="scss">
</style>