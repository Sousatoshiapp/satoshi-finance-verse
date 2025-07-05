default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    build_app(scheme: "satoshi-invest-app")
    upload_to_testflight
  end
end
