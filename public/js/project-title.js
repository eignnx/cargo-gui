const projectTitle = Vue.component("project-title", {
    props: ["title", "path"],
    template: `
    <header>
        <h1 class="display-1" id="project-title">{{ title }}</h1>
        <h3 class="text-muted">{{ path }}</h3>
    </header>
    `,
});