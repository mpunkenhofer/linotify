# Uses inkscape to convert a svg file to png icons

import os
import argparse
from pathlib import Path


def file_exists(file_name):
    return Path(file_name).is_file()


def main():
    print('svg 2 pngs!')
    parser = argparse.ArgumentParser(
        description='Svg Icon to pngs!\nConverts the svg file to pngs of various sizes!')

    parser.add_argument('input', type=str,
                        help='input .svg file')
    parser.add_argument('-p', '--prefix', type=str, default='output',
                        help='output file name prefix')
    parser.add_argument('-d', '--directory', type=str, default='',
                        help='output directory')
    parser.add_argument('-r', '--resolutions', type=int, nargs='*', default=[16, 32, 64, 96, 128],
                        help='Comma seperated list of output resolutions.')
    args = parser.parse_args()

    if not file_exists(args.input):
        print("Error: file '%s' does not exists." % args.input)
        return 1

    print('converting ...')

    for r in args.resolutions:
        os.system("inkscape {} --export-png={} -w {} -h {}".format(args.input, str(Path(args.directory, '{}{}'.format(args.prefix, r)).with_suffix('.png')), r, r))

    print('done!')


if __name__ == "__main__":
    main()
