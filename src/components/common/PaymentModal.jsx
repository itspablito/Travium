import React, { useState } from "react"
import { CreditCard, Lock, Mail, Calendar, Shield, Building2, Wallet, X } from "lucide-react"

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  onPaymentSuccess,
  purchaseData // { type: 'vuelo'|'alojamiento'|'vehiculo', description, ...otherData }
}) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    email: "",
    bank: "",
    documentType: "",
    documentNumber: "",
    phoneNumber: "",
  })

  const [errors, setErrors] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    email: "",
    bank: "",
    documentType: "",
    documentNumber: "",
    phoneNumber: "",
  })

  const [touched, setTouched] = useState({
    cardholderName: false,
    cardNumber: false,
    expirationDate: false,
    cvv: false,
    email: false,
    bank: false,
    documentType: false,
    documentNumber: false,
    phoneNumber: false,
  })

  const validateField = (name, value) => {
    let error = ""

    switch (name) {
      case "cardholderName":
        if (!value.trim()) error = "El nombre del titular es obligatorio"
        break
      case "cardNumber":
        if (!value) error = "El número de tarjeta es obligatorio"
        else if (!/^\d{10}$/.test(value)) error = "El número de tarjeta debe tener exactamente 10 dígitos"
        break
      case "expirationDate":
        if (!value) error = "La fecha de expiración es obligatoria"
        else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) error = "Formato inválido. Use MM/AA"
        break
      case "cvv":
        if (!value) error = "El CVV es obligatorio"
        else if (!/^\d{3,4}$/.test(value)) error = "El CVV debe tener 3 o 4 dígitos"
        break
      case "email":
        if (!value) error = "El correo electrónico es obligatorio"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Formato de correo electrónico inválido"
        break
      case "bank":
        if (!value) error = "Debe seleccionar un banco"
        break
      case "documentType":
        if (!value) error = "Debe seleccionar un tipo de documento"
        break
      case "documentNumber":
        if (!value) error = "El número de documento es obligatorio"
        else if (!/^\d{6,12}$/.test(value)) error = "El número de documento debe tener entre 6 y 12 dígitos"
        break
      case "phoneNumber":
        if (!value) error = "El número de celular es obligatorio"
        else if (!/^\d{10}$/.test(value)) error = "El número de celular debe tener 10 dígitos"
        break
    }

    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let newValue = value

    if (name === "cardNumber") {
      newValue = value.replace(/\D/g, "").slice(0, 10)
    } else if (name === "cvv") {
      newValue = value.replace(/\D/g, "").slice(0, 4)
    } else if (name === "expirationDate") {
      newValue = value.replace(/\D/g, "")
      if (newValue.length >= 2) {
        newValue = newValue.slice(0, 2) + "/" + newValue.slice(2, 4)
      }
    } else if (name === "documentNumber") {
      newValue = value.replace(/\D/g, "").slice(0, 12)
    } else if (name === "phoneNumber") {
      newValue = value.replace(/\D/g, "").slice(0, 10)
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }))

    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const isFormValid = () => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

    if (paymentMethod === "card") {
      return (
        formData.cardholderName.trim() !== "" &&
        formData.cardNumber.length === 10 &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expirationDate) &&
        /^\d{3,4}$/.test(formData.cvv) &&
        emailValid &&
        !Object.values(errors).some((error) => error !== "")
      )
    } else if (paymentMethod === "pse") {
      return (
        formData.bank !== "" &&
        formData.documentType !== "" &&
        /^\d{6,12}$/.test(formData.documentNumber) &&
        emailValid &&
        !Object.values(errors).some((error) => error !== "")
      )
    } else {
      return /^\d{10}$/.test(formData.phoneNumber) && emailValid && !Object.values(errors).some((error) => error !== "")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (paymentMethod === "card") {
      setTouched({
        cardholderName: true,
        cardNumber: true,
        expirationDate: true,
        cvv: true,
        email: true,
        bank: false,
        documentType: false,
        documentNumber: false,
        phoneNumber: false,
      })
    } else if (paymentMethod === "pse") {
      setTouched({
        cardholderName: false,
        cardNumber: false,
        expirationDate: false,
        cvv: false,
        email: true,
        bank: true,
        documentType: true,
        documentNumber: true,
        phoneNumber: false,
      })
    } else {
      setTouched({
        cardholderName: false,
        cardNumber: false,
        expirationDate: false,
        cvv: false,
        email: true,
        bank: false,
        documentType: false,
        documentNumber: false,
        phoneNumber: true,
      })
    }

    if (isFormValid()) {
      setIsProcessing(true)
      
      // Simular procesamiento de pago
      setTimeout(() => {
        const paymentData = {
          paymentMethod,
          cardholderName: formData.cardholderName || formData.email,
          email: formData.email,
          documentNumber: formData.documentNumber,
          bank: formData.bank,
          phoneNumber: formData.phoneNumber,
          amount,
        }
        
        onPaymentSuccess(paymentData)
        setIsProcessing(false)
      }, 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pasarela de pago</h2>
              <p className="text-blue-100 text-sm">{purchaseData?.description || 'Completa los datos para finalizar tu compra'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-4 mt-4 flex-wrap">
            {paymentMethod === "card" && (
              <>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-semibold text-xs">Visa</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-semibold text-xs">MasterCard</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-semibold text-xs">AMEX</span>
                </div>
              </>
            )}
            {paymentMethod === "pse" && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="font-semibold text-xs">PSE - Pagos Seguros en Línea</span>
              </div>
            )}
            {(paymentMethod === "nequi" || paymentMethod === "daviplata") && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span className="font-semibold text-xs">{paymentMethod === "nequi" ? "Nequi" : "Daviplata"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Amount Display */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Monto a pagar:</span>
              <span className="text-2xl font-bold text-gray-900">${amount.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Método de pago *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-3 border-2 rounded-lg transition-all ${
                  paymentMethod === "card"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <CreditCard
                  className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === "card" ? "text-blue-600" : "text-gray-400"}`}
                />
                <span className={`text-xs font-medium ${paymentMethod === "card" ? "text-blue-600" : "text-gray-700"}`}>
                  Tarjeta
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("pse")}
                className={`p-3 border-2 rounded-lg transition-all ${
                  paymentMethod === "pse"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Building2
                  className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === "pse" ? "text-blue-600" : "text-gray-400"}`}
                />
                <span className={`text-xs font-medium ${paymentMethod === "pse" ? "text-blue-600" : "text-gray-700"}`}>
                  PSE
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("nequi")}
                className={`p-3 border-2 rounded-lg transition-all ${
                  paymentMethod === "nequi"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Wallet
                  className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === "nequi" ? "text-blue-600" : "text-gray-400"}`}
                />
                <span
                  className={`text-xs font-medium ${paymentMethod === "nequi" ? "text-blue-600" : "text-gray-700"}`}
                >
                  Nequi
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("daviplata")}
                className={`p-3 border-2 rounded-lg transition-all ${
                  paymentMethod === "daviplata"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Wallet
                  className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === "daviplata" ? "text-blue-600" : "text-gray-400"}`}
                />
                <span
                  className={`text-xs font-medium ${paymentMethod === "daviplata" ? "text-blue-600" : "text-gray-700"}`}
                >
                  Daviplata
                </span>
              </button>
            </div>
          </div>

          {paymentMethod === "card" && (
            <>
              <div className="mb-4">
                <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del titular *
                </label>
                <input
                  type="text"
                  id="cardholderName"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.cardholderName && touched.cardholderName ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.cardholderName && touched.cardholderName && (
                  <p className="mt-1 text-xs text-red-600">{errors.cardholderName}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de tarjeta *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pl-12 ${
                      errors.cardNumber && touched.cardNumber ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="1234567890"
                    maxLength={10}
                  />
                  <CreditCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                {errors.cardNumber && touched.cardNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de expiración *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="expirationDate"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pl-12 ${
                        errors.expirationDate && touched.expirationDate ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.expirationDate && touched.expirationDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.expirationDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="password"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.cvv && touched.cvv ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && touched.cvv && <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>}
                </div>
              </div>
            </>
          )}

          {paymentMethod === "pse" && (
            <>
              <div className="mb-4">
                <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-2">
                  Banco *
                </label>
                <div className="relative">
                  <select
                    id="bank"
                    name="bank"
                    value={formData.bank}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pl-12 appearance-none ${
                      errors.bank && touched.bank ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione su banco</option>
                    <option value="bancolombia">Bancolombia</option>
                    <option value="davivienda">Davivienda</option>
                    <option value="bbva">BBVA</option>
                    <option value="banco-bogota">Banco de Bogotá</option>
                    <option value="banco-occidente">Banco de Occidente</option>
                    <option value="banco-popular">Banco Popular</option>
                    <option value="colpatria">Scotiabank Colpatria</option>
                    <option value="av-villas">AV Villas</option>
                  </select>
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.bank && touched.bank && <p className="mt-1 text-xs text-red-600">{errors.bank}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de documento *
                  </label>
                  <select
                    id="documentType"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none ${
                      errors.documentType && touched.documentType ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione</option>
                    <option value="cc">Cédula de Ciudadanía</option>
                    <option value="ce">Cédula de Extranjería</option>
                    <option value="nit">NIT</option>
                    <option value="pasaporte">Pasaporte</option>
                  </select>
                  {errors.documentType && touched.documentType && (
                    <p className="mt-1 text-xs text-red-600">{errors.documentType}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de documento *
                  </label>
                  <input
                    type="text"
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.documentNumber && touched.documentNumber ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="1234567890"
                  />
                  {errors.documentNumber && touched.documentNumber && (
                    <p className="mt-1 text-xs text-red-600">{errors.documentNumber}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {(paymentMethod === "nequi" || paymentMethod === "daviplata") && (
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Número de celular *
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.phoneNumber && touched.phoneNumber ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="3001234567"
                maxLength={10}
              />
              {errors.phoneNumber && touched.phoneNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Recibirás una notificación para aprobar el pago desde tu app de{" "}
                {paymentMethod === "nequi" ? "Nequi" : "Daviplata"}
              </p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pl-12 ${
                  errors.email && touched.email ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="correo@ejemplo.com"
              />
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            {errors.email && touched.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="mb-4 flex items-center justify-center gap-2 text-gray-600 text-sm">
            <Lock className="w-4 h-4" />
            <span>Pago seguro · Datos protegidos</span>
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || isProcessing}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isFormValid() && !isProcessing
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "Procesando pago..." : isFormValid() ? "Pagar ahora" : "Complete todos los campos"}
          </button>
        </form>
      </div>
    </div>
  )
}
