'use strict';

const exec = require('child_process').exec;
const fs = require('fs');

module.exports = function(DeepLearning) {
    DeepLearning.predict = function(imageName, cb) {    
        const labelImageDir = './trained-model-inception/label_image.py';
        const outputGraphDir = './trained-model-inception/output_graph.pb';
        const outputLabelsDir = './trained-model-inception/output_labels.txt';
        const imageDir = DeepLearning.app.datasources['storage'].settings.root + '/temp/' + imageName;

        var command = 'python3 ' + labelImageDir + ' --graph=' + outputGraphDir + ' --labels=' + outputLabelsDir + ' --input_layer=Mul --output_layer=final_result --image=' + imageDir;

        exec(command, (err, stdout, stderr) => {
            if (err) return cb(err);

            cb(null, parsePrediction(stdout));
            console.log('Model Prediction stderr: ' + stderr);

            // delete predicted image
            fs.unlink(imageDir, err => {
                if (err) return cb(err);
            });
        });
    }

    // Parse string prediction into json
    function parsePrediction(stdout) {
        const outputResult = stdout;

        // transform outputResult
        const splittedResult = outputResult.split('\n');

        // generation json
        let predictionJson = {};
        
        /* Example:
           pneumonia virus 0.45211023
           normal 0.3570113
           pneumonia bacteria 0.1908785
        */
        splittedResult.forEach(data => {
            if (data !== '') {
                const splittedData = data.split(' ');

                if (data.includes("virus"))                
                    predictionJson["pneumonia virus"] = Number(splittedData[2]);
                else if (data.includes("bacteria"))                                    
                    predictionJson["pneumonia bacteria"] = Number(splittedData[2]);                
                else
                    predictionJson["normal"] = Number(splittedData[1]);                                
            }
        });

        return predictionJson;
    }

    DeepLearning.remoteMethod(
        'predict',
        {
            description: 'DeepLearning prediction',
            accepts: {arg: 'imageName', type: 'string', required: true},
            returns: {arg: 'prediction', type: 'object'},
            http: {verb: 'get'}
        }
    );
};
