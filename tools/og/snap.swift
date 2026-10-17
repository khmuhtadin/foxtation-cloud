import AppKit
import WebKit
// Renders the share image: swift tools/og/snap.swift tools/og/og.html og@2x.png
// then: sips -z 630 1200 og@2x.png --out site/assets/og.png
let args = CommandLine.arguments
let page = URL(fileURLWithPath: args[1]), out = URL(fileURLWithPath: args[2])
final class Snapper: NSObject, WKNavigationDelegate {
    let web = WKWebView(frame: NSRect(x: 0, y: 0, width: 1200, height: 630))
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            let config = WKSnapshotConfiguration()
            config.snapshotWidth = 1200
            webView.takeSnapshot(with: config) { image, error in
                guard let image, let tiff = image.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
                      let png = rep.representation(using: .png, properties: [:]) else { print(error ?? "no image"); exit(1) }
                try! png.write(to: out); print("wrote", rep.pixelsWide, "x", rep.pixelsHigh); exit(0)
            }
        }
    }
}
let app = NSApplication.shared
let snapper = Snapper()
snapper.web.navigationDelegate = snapper
snapper.web.loadFileURL(page, allowingReadAccessTo: URL(fileURLWithPath: FileManager.default.currentDirectoryPath))
app.run()
