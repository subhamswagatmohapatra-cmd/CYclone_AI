import os
import zipfile
import tarfile
import time

SRC_DIR = 'cycloneai-project'
ZIP_PUBLIC = 'public/cycloneai-complete-project.zip'
ZIP_ROOT = 'cycloneai-complete-project.zip'
TAR_PUBLIC = 'public/cycloneai-complete-project.tar.gz'
TAR_ROOT = 'cycloneai-complete-project.tar.gz'

def create_standard_zip(dest_zip):
    with zipfile.ZipFile(dest_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        now = time.localtime(time.time())[:6]
        
        # Explicit root directory entry
        root_info = zipfile.ZipInfo('cycloneai-project/', now)
        root_info.external_attr = (0o755 << 16) | 0x10  # MS-DOS directory bit + Unix rwxr-xr-x
        zf.writestr(root_info, '')

        dirs_added = {'cycloneai-project/'}

        for root, dirs, files in os.walk(SRC_DIR):
            for d in sorted(dirs):
                full_dir = os.path.join(root, d)
                rel_dir = os.path.relpath(full_dir, SRC_DIR).replace(os.sep, '/')
                archive_dir = f'cycloneai-project/{rel_dir}/'
                if archive_dir not in dirs_added:
                    dirs_added.add(archive_dir)
                    d_info = zipfile.ZipInfo(archive_dir, now)
                    d_info.external_attr = (0o755 << 16) | 0x10
                    zf.writestr(d_info, '')

            for f in sorted(files):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, SRC_DIR).replace(os.sep, '/')
                archive_path = f'cycloneai-project/{rel_path}'
                f_info = zipfile.ZipInfo(archive_path, now)
                f_info.external_attr = (0o644 << 16) | 0x20  # standard file bit
                f_info.compress_type = zipfile.ZIP_DEFLATED
                with open(full_path, 'rb') as fp:
                    zf.writestr(f_info, fp.read())

create_standard_zip(ZIP_PUBLIC)
create_standard_zip(ZIP_ROOT)

for tar_path in [TAR_PUBLIC, TAR_ROOT]:
    with tarfile.open(tar_path, 'w:gz') as tar:
        tar.add(SRC_DIR, arcname='cycloneai-project')

print('ZIP created:', os.path.getsize(ZIP_PUBLIC), 'bytes')
print('TAR.GZ created:', os.path.getsize(TAR_PUBLIC), 'bytes')
