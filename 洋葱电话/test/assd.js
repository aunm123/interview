let src = "http://re.test.ssyx99.com/record/RE57ef981a1b36fd4960cc67c824c771c0";
let tempFileName = src =src.replace(/(.*\/)*([^.]+)/i,"$2");
let fileType = tempFileName.substring(tempFileName.lastIndexOf("."));
if (tempFileName.lastIndexOf(".") < 0) {
	fileType = "wav"
}
console.log(fileType);
