const paginationNav = Vue.component("pagination-nav", {
    props: [
        "ariaLabel",
        "itemCount",
    ],

    template: `
    <nav :aria-label="ariaLabel">
        <ul class="pagination justify-content-center">
            <li :class="prevClasses"><a class="page-link" @click="prev" href="#">Previous</a></li>
            <li :class="firstClasses"><a class="page-link" @click="first" href="#">First</a></li>

            <!-- Current -->
            <li class="page-item active"><span class="page-link" href="#">{{ currentIdx + 1 }} of {{ itemCount }}</span></li>

            <li :class="lastClasses"><a class="page-link" @click="last" href="#">Last</a></li>
            <li :class="nextClasses"><a class="page-link" @click="next" href="#">Next</a></li>
        </ul>
    </nav>
    `,

    data: () => ({
        currentIdx: 0,
    }),

    methods: {
        prev() {
            this.currentIdx--;
            this.$emit("input", this.currentIdx);
        },

        first() {
            this.currentIdx = 0;
            this.$emit("input", this.currentIdx);
        },

        last() {
            this.currentIdx = this.itemCount - 1;
            this.$emit("input", this.currentIdx);
        },

        next() {
            this.currentIdx++;
            this.$emit("input", this.currentIdx);
        },
    },

    computed: {
        firstClasses() {
            return {
                "active": this.currentIdx === 0,
                "page-item": true,
            };
        },

        prevClasses() {
            return {
                "disabled": this.currentIdx === 0,
                "page-item": true,
            };
        },

        nextClasses() {
            return {
                "disabled": this.currentIdx === this.itemCount - 1,
                "page-item": true,
            };
        },

        lastClasses() {
            return {
                "active": this.currentIdx === this.itemCount - 1,
                "page-item": true,
            };
        },
    },
});