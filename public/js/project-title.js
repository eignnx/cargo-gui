const projectTitle = Vue.component("project-title", {
    props: ["title"],
    template: `
    <header>
        <h1 id="project-title">{{ title }}</h1>
    </header>
    `,
});