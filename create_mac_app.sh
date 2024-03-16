# Set These:

APP_NAME="Icon Resizer"
PROJECT_DIR="."

APPLE_DISTRIBUTION_CERT="Apple Distribution: Wing To Wong (447H88N27M)"
THIRD_PARTY_MAC_DEVELOPER_CERT="3rd Party Mac Developer Installer: Wing To Wong (447H88N27M)"

# Change if needed:

APP_BUNDLE="$APP_NAME.app"
APP_EXECUTABLE="$APP_BUNDLE/Contents/MacOS/$APP_NAME"
APP_PACKAGE="$APP_NAME.pkg"

# Build, Sign, Package, Upload:

cargo tauri build --target universal-apple-darwin --bundles none

cp -r "$PROJECT_DIR/src-tauri/target/universal-apple-darwin/release/bundle/macos/$APP_BUNDLE" .

cp "embedded.provisionprofile" "$APP_BUNDLE/Contents/embedded.provisionprofile"

codesign \
	--sign "$APPLE_DISTRIBUTION_CERT" \
	--entitlements "entitlements.plist" \
	"$APP_EXECUTABLE"

productbuild \
	--sign "$THIRD_PARTY_MAC_DEVELOPER_CERT" \
	--component "$APP_BUNDLE" "/Applications" \
	"$APP_PACKAGE"

