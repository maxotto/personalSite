# -*- mode: ruby -*-
# vi: set ft=ruby :
# This image from http://devopera.com/applications/linux-apache-mysql-php-lamp
# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  config.vbguest.iso_path = "c:/Program Files/Oracle/VirtualBox/VBoxGuestAdditions.iso"
  config.vbguest.auto_update = true
  #config.vbguest.no_remote = true
  config.vm.box = "brownell/xenial64lemp"
  # config.vm.box_check_update = false
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../WorkingCopyForVagrant", "/fcpdtv_source"
  # config.vm.synced_folder "../Vagrant_tmp", "/fcpdtv_tmp"

  config.vm.synced_folder "./www/dist", "/var/www/agmsite"

  # config.vm.synced_folder "B:/msk-vds02s01.rtrs.local/fcpdtv/raw/", "/fcpdtv_backups"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
  #   vb.gui = true
  #
  #   # Customize the amount of memory on the VM:
     vb.memory = "2048"
  end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Define a Vagrant Push strategy for pushing to Atlas. Other push strategies
  # such as FTP and Heroku are also available. See the documentation at
  # https://docs.vagrantup.com/v2/push/atlas.html for more information.
  # config.push.define "atlas" do |push|
  #   push.app = "YOUR_ATLAS_USERNAME/YOUR_APPLICATION_NAME"
  # end

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  # config.vm.provision "shell", inline: <<-SHELL
  #       echo -e "\n--- Ok, start provisioning now... ---\n"
  #       echo -e "\n--- Updating system ---\n"
  #       sudo apt-get -y update  >> /vagrant/vm_build.log 2>&1
  #       echo -e "\n--- Upgrading system ---\n"
  #       sudo dpkg --configure -a >> /vagrant/vm_build.log 2>&1
  #       DEBIAN_FRONTEND=noninteractive apt-get -y -o DPkg::options::="--force-confdef" -o DPkg::options::="--force-confold" upgrade
  # SHELL
  config.vm.provision :shell, path: "provisioning/Vagrant.bootstrap.sh"
end
