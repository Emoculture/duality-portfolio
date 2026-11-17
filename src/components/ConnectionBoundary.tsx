import { Component, type ReactNode } from "react";

/** A broken cinematic must never prevent the already unlocked archive opening. */
export default class ConnectionBoundary extends Component<{ onFailure: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
