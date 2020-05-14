import React, { Component } from "react";
import axios from "axios";

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ""
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    const values = await axios.get("/api/values/current");
    this.setState({ values: values.data });
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get("/api/values/all");
    this.setState({ seenIndexes: seenIndexes.data });
  }

  handleSubmit = async (ev) => {
    ev.preventDefault();

    await axios.post("/api/values", { index: this.state.index });

    this.setState({ index: "" });
  };

  renderSeenIndexes() {
    return this.state.seenIndexes.map(({ number }) => number).join(", ");
  }

  renderValues() {
    const { values } = this.state;
    const entries = [];

    for (let key in values) {
      entries.push(
        <div key={key}>
          <p>For index {key} I calculated {values[key]}</p>
        </div>
      );
    }

    return entries;
  }

  render() {
    return (
      <div>
        <form action="" onSubmit={this.handleSubmit}>
          <label>Enter your index</label>
          <input
            value={this.state.index}
            onChange={ev => this.setState({ index: ev.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated values:</h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;