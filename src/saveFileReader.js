import JSZip from "jszip";
import Worker from "worker-loader!./saveParser.worker.js";

export default class SaveFileReader{
	zipToText(e){
		return new Promise((resolve, reject) => {
			const zipLoader = new JSZip();

			zipLoader.loadAsync(e.dataTransfer.files[0])
				.then(zip => zip.file("gamestate").async("text"))
				.then(text => resolve(text))
				.catch(err => reject(err));
		});
	}
	textToObj(text){
		return new Promise((resolve, reject) => {
			const saveFileWorker = new Worker();
			saveFileWorker.postMessage(text);
			saveFileWorker.addEventListener("message", resp => resolve(JSON.parse(resp.data)));
			saveFileWorker.addEventListener("error", reject);
		});
	}
	getSaveObj(e){
		return new Promise((resolve, reject) => {
			this.zipToText(e)
				.then(text => this.textToObj(text))
				.then(obj => resolve(obj))
				.catch(err => reject(err));
		});
	}
}