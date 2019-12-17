const loadingIndicator = Vue.component("loading-indicator", {
    template: `
    <div class="row my-5">
        <div class="col col-lg-3">
            <button
                class="btn btn-outline-secondary btn-lg"
                @click="cancel"
                disabled
            >Cancel (^C)</button>
        </div>

        <div class="col text-center">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </div>
    `,

    methods: {
        cancel() {
            this.$emit('cancel');
        }
    },
});
