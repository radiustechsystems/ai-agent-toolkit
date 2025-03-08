from dataclasses import dataclass

from radius.classes.plugin_base import PluginBase
from .service import JSONRpcService

__version__ = "1.0.0"


@dataclass
class JSONRpcPluginOptions:
    endpoint: str


class JSONRpcPlugin(PluginBase):
    def __init__(self, options: JSONRpcPluginOptions):
        super().__init__("jsonrpc", [JSONRpcService(options.endpoint)])

    def supports_chain(self, chain) -> bool:
        return True


def jsonrpc(options: JSONRpcPluginOptions) -> JSONRpcPlugin:
    return JSONRpcPlugin(options)
