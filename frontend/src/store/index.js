import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cmdRunning: false,
    releaseBuild: false,
    stdoutLines: null,
    stderrLines: null,
    stdoutLinesDone: true,
    stderrLinesDone: true,
    cmdStatus: null,
    history: []
  },

  mutations: {
    resetCmd(state) {
      state.cmdRunning = true;
      state.cmdStatus = null;
      state.stdoutLines = [];
      state.stderrLines = [];
      state.stdoutLinesDone = false;
      state.stderrLinesDone = false;
    },

    logCargoCmdInHistory(state, [cmd, ...cargoOpts]) {
      const cmdText = `cargo ${cmd} ${cargoOpts.join(" ")}`.trim();
      state.history.push(cmdText);
    },

    setStatusCode(state, code) {
      state.cmdStatus = code;
    },

    stdoutLinesPush(state, line) {
      state.stdoutLines.push(line);
    },

    stderrLinesPush(state, line) {
      state.stderrLines.push(line);
    },

    stdoutLinesDone(state) {
      state.stdoutLinesDone = true;
    },

    stderrLinesDone(state) {
      state.stderrLinesDone = true;
    },

    cmdFinished(state) {
      state.cmdRunning = false;
    }
  },

  getters: {

    cmdResultsReady(state) {
      return state.stdoutLinesDone && state.stderrLinesDone && state.cmdStatus !== null;
    },

    mostRecentCmd(state) {
      return state.history.length ? state.history[state.history.length - 1] : null;
    }
  },

  actions: {

    // Returns a promise that resolves when everything is done.
    // Resolves to the status code of the command run.
    async runCargoCmd({ dispatch, commit }, [cmd, ...cargoOpts]) {
      commit("resetCmd");
      commit("logCargoCmdInHistory", [cmd, ...cargoOpts]);

      const _resp = await fetch("/api/cargo", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ cmd, cargoOpts })
      });

      const values = await Promise.all([
        dispatch("readNextLine", "stdout"),
        dispatch("readNextLine", "stderr"),
      ]);

      const [cmdStatus] = values.filter(x => x !== null);
      return cmdStatus;
    },

    // Returns a promise that resolves when everything is done.
    // Resolves to either the status code or null.
    async readNextLine({ dispatch, commit, getters }, streamName) {
      const resp = await fetch(`/api/${streamName}_line`);
      const json = await resp.json();

      if (json.hasOwnProperty("line")) {
        const { line } = json;
        commit(`${streamName}LinesPush`, line);
        await dispatch("readNextLine", streamName);
      } else if (json === "end") {
        commit(`${streamName}LinesDone`);
        if (!getters.cmdRunning) {
          // Both stdout and stderr have been read to completion. Command is finished.
          return await dispatch("getStatusCode");
        } else {
          // The other stdio stream is not done yet, so no result can be returned yet.
          return null;
        }
      }
    },

    async getStatusCode({ commit }) {
      const resp = await fetch("/api/cmd_status");
      const json = await resp.json();
      if (json.hasOwnProperty("ready")) {
        const code = json["ready"];
        console.log("GOT THE STATUS CODE:", code);
        commit("setStatusCode", code);
        commit("cmdFinished");
        return code;
      } else {
        return await commit("getStatusCode");
      }
    },
  },

  modules: {}
});
