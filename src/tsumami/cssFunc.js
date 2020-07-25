// css
export const _px = (num) => {
	return num + "px";
}

export const _deg = (num) => {
	return num + "deg";
}

export const _rotate = (num) => {
	return "rotate(" + _deg(Math.floor(num)) + ")";
}

export const _skewY = (num) => {
	return "skewY(" + _deg(Math.floor(num)) + ")";
}

// css取得/付与系
export const _whileSpace = (obj) => {
	let returnObj = "";
	for (let v of obj) {
		returnObj += v + " ";
	}
	return returnObj;
}

export const _returnTransformValue = (element, name) => {
	const tName = name + "(";
	return +(element.replace(tName, "").replace("deg)", ""));
}