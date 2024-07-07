export const PYTHON_IMAGE = "python:3.8-slim";

// This will represent the header size of docker stream
// docker stream header will contain data about
// - type of stream i.e. stdout/stderr
// - length of data
// first 4 bytes is type of stream and the next 4 bytes is length of data
export const DOCKER_STREAM_HEADER_SIZE = 8; //8 Bytes
