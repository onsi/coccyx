task :default => [:compile, :specs]

desc "Compile Coccyx"
task :compile do
  coccyx_base = File.open('./src/CoccyxBase.js', 'r').read

  File.open("./Coccyx.js", 'w') do |f|
    f << File.open("./src/ObtrusiveCoccyx.js").read.gsub("//include:CoccyxBase.js", coccyx_base)
  end    

  File.open("./UnobtrusiveCoccyx.js", 'w') do |f|
    f << File.open("./src/UnobtrusiveCoccyx.js").read.gsub("//include:CoccyxBase.js", coccyx_base)
  end    
end

task :specs do
  `open ./spec/CoccyxSpecRunner.html`
  `open ./spec/UnobtrusiveCoccyxSpecRunner.html`
end