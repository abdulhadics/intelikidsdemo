"""Export IntelliKids' trained CNN for OpenCV. Requires h5py and onnx."""

from pathlib import Path

import h5py
import onnx
from onnx import TensorProto, helper, numpy_helper


def export_model(model_dir):
    nodes = []
    weights = []

    def add_node(op, inputs, output, **attributes):
        nodes.append(helper.make_node(op, inputs, [output], **attributes))
        return output

    with h5py.File(model_dir / "distraction_model.hdf5", "r") as source:
        layers = source["model_weights"]

        def layer_parameters(name, axes):
            layer = layers[name][name]
            kernel = name + "_kernel"
            bias = name + "_bias"
            weights.extend([
                numpy_helper.from_array(layer["kernel:0"][:].transpose(axes), kernel),
                numpy_helper.from_array(layer["bias:0"][:], bias),
            ])
            return [kernel, bias]

        value = "eyes"
        for index in range(1, 4):
            layer_name = f"conv2d_{index}"
            # Keras stores HWIO kernels. ONNX convolution uses OIHW.
            parameters = layer_parameters(layer_name, (3, 2, 0, 1))
            value = add_node("Conv", [value, *parameters], layer_name, kernel_shape=[3, 3])
            value = add_node("Relu", [value], f"relu_{index}")
            value = add_node("MaxPool", [value], f"pool_{index}", kernel_shape=[2, 2], strides=[2, 2])

        # The original dense layer expects Keras' channels-last flatten order.
        value = add_node("Transpose", [value], "channels_last", perm=[0, 2, 3, 1])
        value = add_node("Flatten", [value], "flattened", axis=1)
        value = add_node("Gemm", [value, *layer_parameters("dense_1", (1, 0))], "dense_1", transB=1)
        value = add_node("Relu", [value], "dense_relu")
        # Dropout is inactive during inference.
        value = add_node("Gemm", [value, *layer_parameters("dense_2", (1, 0))], "dense_2", transB=1)
        add_node("Sigmoid", [value], "probability")

    graph = helper.make_graph(
        nodes,
        "IntelliKids focus CNN",
        [helper.make_tensor_value_info("eyes", TensorProto.FLOAT, ["batch", 3, 64, 64])],
        [helper.make_tensor_value_info("probability", TensorProto.FLOAT, ["batch", 1])],
        weights,
    )
    model = helper.make_model(graph, ir_version=7, opset_imports=[helper.make_opsetid("", 11)])
    onnx.checker.check_model(model)
    onnx.save(model, model_dir / "distraction_model.onnx")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    export_model(root / "distractionModel" / "cnn")
