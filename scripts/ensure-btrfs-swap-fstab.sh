#!/usr/bin/env bash
# Ensures disk-backed btrfs swap persists in /etc/fstab (zram stays higher priority).
# Run once as root: sudo bash scripts/ensure-btrfs-swap-fstab.sh
#
# Do not use swapoff -a here: on Fedora that tears down zram and can leave zram0 in a
# state where systemd-zram-setup fails until /sys/block/zram0/reset is written.
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

if [[ ! -f /swap/swapfile ]]; then
  echo "Missing /swap/swapfile — create it first:" >&2
  echo "  btrfs filesystem mkswapfile --size 16G /swap/swapfile" >&2
  echo "  swapon -p 10 /swap/swapfile" >&2
  exit 1
fi

if grep -qF '/swap/swapfile' /etc/fstab; then
  echo "fstab already references /swap/swapfile"
else
  printf '\n# SSD btrfs swap (overflow; zram uses higher swapon priority)\n/swap/swapfile none swap sw,pri=10 0 0\n' >> /etc/fstab
  echo "Appended /swap/swapfile to /etc/fstab"
fi

# Enable any swap entries from fstab that are not yet active (safe with zram).
swapon -a
echo "---"
swapon --show
echo "---"
free -h

# Optional tuning (only if you measure constant SSD thrashing): lower vm.swappiness (e.g. 10–30)
# via sysctl.d so the kernel prefers keeping pages in RAM; defaults are fine for most desktops.
