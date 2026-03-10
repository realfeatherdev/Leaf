let behaviorList = [
    {
        type: "IGNORE",
        reg: /^(bkign:)|(\+PRISM)/ // if it contains +PRISM or starts with bkign: ignore it.
    },
    {
        type: "PART",
        name: "Customizer Creations",
        reg: /^(?=.*segmentedstorage)(?=.*uis~new)/
    },
    {
        type: "PART",
        name: "Everything Else",
        $p: 1 // catch all else
    }
]