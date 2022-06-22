import { get } from 'svelte/store';
import App from './App.svelte';
import { currentView } from "./stores/viewingMode";

const app = new App({
	target: document.body
});

const init_comp = async () => { // initialization script
	// TODO: stuff	
}

window.onload = () => {
	console.log("webview loaded!");
	init_comp(); // asynchronously initialize all components
}

export default app;