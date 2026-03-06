require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name             = 'NtsinizAudioRoute'
  s.version          = package['version']
  s.summary          = 'Ntsiniz audio route module'
  s.description      = 'Audio route events and input selection for Ntsiniz.'
  s.homepage         = 'https://example.com/ntsiniz'
  s.license          = 'MIT'
  s.author           = 'Ntsiniz'
  s.platforms        = { :ios => '15.1', :tvos => '15.1' }
  s.swift_version    = '5.9'
  s.source           = { :git => 'https://example.com/ntsiniz.git', :tag => s.version.to_s }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
