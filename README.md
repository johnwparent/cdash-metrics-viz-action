# CDash Metrics Viz Action

This action is intended for those who are uploading the ouput of a clang tidy run to CDash
as a file, and wish to visualize that output as software metrics via the <https://corsa.center/dashboard/explore/project-metrics> visualizer.

## Inputs

### `build-directory`

**Required**: An absolute or relative (to the CWD of the action) path to the CMake build tree in which a Dashboard client script has been executed.

### `cdash`

**Required**: The base url to the CDash dashboard to which your clang-tidy results were uploaded, i.e. my.cdash.org

## Outputs

### `url`

The metrics visualizer url from which you can view your Dashboard metrics

## Example Useage

```yaml
uses: johnwparent/cdash-metrics-viz-action@e76147da8e5c81eaf017dede5645551d4b94427b
with:
    build-directory: build
    cdash: my.cdash.org
```
