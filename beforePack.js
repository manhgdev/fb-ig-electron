
const JavaScriptObfuscator = require('javascript-obfuscator')
const fs = require('fs')
const path = require('path')

exports.default = async () => {
    
    const files = [
        path.resolve(__dirname, 'main.js'),
        path.resolve(__dirname, 'src/run.js'),
        path.resolve(__dirname, 'src/card.js'),
        path.resolve(__dirname, 'src/core.js'),
        path.resolve(__dirname, 'src/tut.js'),
        path.resolve(__dirname, 'src/bm.js'),
        path.resolve(__dirname, 'src/createInsta.js'),
        path.resolve(__dirname, 'src/insta.js'),
        path.resolve(__dirname, 'src/runAd.js'),
        path.resolve(__dirname, 'src/runApi.js'),
        path.resolve(__dirname, 'src/runInsta.js'),
        path.resolve(__dirname, 'src/loginApi.js'), 
    ]

    if (!fs.existsSync('backup')) {
        await fs.promises.mkdir('backup')
    }

    for (let index = 0; index < files.length; index++) {

        await fs.promises.copyFile(files[index], 'backup/'+path.basename(files[index]))

        const file = await fs.promises.readFile(files[index], {encoding: 'utf-8'})
        
        const obfuscationResult = JavaScriptObfuscator.obfuscate(file, {
            optionsPreset: "high-obfuscation",
            compact: true,
            selfDefending: true,
            disableConsoleOutput: true,
            debugProtection: true,
            debugProtectionInterval: 4000,
            splitStrings: true,
            splitStringsChunkLength: 5,
            splitStringsChunkLengthEnabled: false,
            stringArray: true,
            stringArrayRotate: true,
            stringArrayRotateEnabled: true,
            stringArrayShuffle: true,
            stringArrayShuffleEnabled: true,
            simplify: true,
            stringArrayThreshold: 1,
            stringArrayThresholdEnabled: true,
            stringArrayIndexesType: ["hexadecimal-number"],
            stringArrayIndexShift: true,
            stringArrayCallsTransform: false,
            stringArrayCallsTransformThreshold: 1,
            stringArrayEncoding: ["none"],
            stringArrayEncodingEnabled: true,
            stringArrayWrappersCount: 5,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 5,
            stringArrayWrappersType: "function",
            numbersToExpressions: true,
            sourceMap: false,
            sourceMapMode: "separate",
            sourceMapBaseUrl: "",
            sourceMapFileName: "",
            domainLock: [],
            domainLockRedirectUrl: "about:blank",
            domainLockEnabled: false,
            forceTransformStrings: [],
            reservedNames: [],
            reservedStrings: [],
            seed: 0,
            controlFlowFlatteningThreshold: 1,
            controlFlowFlattening: true,
            deadCodeInjectionThreshold: 1,
            deadCodeInjection: true,
            unicodeEscapeSequence: false,
            renameGlobals: false,
            renameProperties: false,
            renamePropertiesMode: "safe",
            target: "node",
            identifierNamesGenerator: "hexadecimal",
            identifiersDictionary: [],
            identifiersPrefix: "",
            transformObjectKeys: true,
            ignoreImports: false,
            config: "",
            exclude: [],
            identifierNamesCache: null,
            inputFileName: "",
            log: false,
            sourceMapSourcesMode: "sources-content"
        })

        const decoded = obfuscationResult.getObfuscatedCode()

        await fs.promises.writeFile(files[index], decoded)

    }

}