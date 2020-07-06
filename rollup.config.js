export default {
    // 入口，要打包的文件
    input: 'src/index.js',
    // 出口
    output: {
        // 包名，输出文件规范如果是 iife/umd，没有 name 会报错。
        name: "casual",
        // 输出文件路径
        file: 'dist/bundle.js',
        // 输出文件规范（amd、cjs、es、iife、umd）
        format: 'umd'
    }
};
