<template>
  <header class="mb-5">
    <h1 class="display-1" id="project-title">{{ title }}</h1>
    <h3 class="text-muted">{{ path }}</h3>
  </header>
</template>

<script>
export default {
  name: "project-title",
  props: ["title", "path"]
};
</script>

<style lang="scss">
</style>