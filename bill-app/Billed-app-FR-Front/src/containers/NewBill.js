import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.filePath = null
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  
  handleChangeFile = e => {
    e.preventDefault()
    const fileInput = this.document.querySelector(`input[data-testid="file"]`)
    if (!["image/jpeg", "image/jpg", "image/png"].includes(fileInput.files[0].type)) {
      fileInput.value = ""
      return alert("Format incorrect : veuillez choisir une image au format png, jpeg ou jpg")
    }
    this.filePath = e.target.value.split(/\\/g)
  }

  handleSubmit = e => {
    e.preventDefault()
    if(this.filePath != null
    && this.document.querySelector(`input[data-testid="datepicker"]`).value != null
    && this.document.querySelector(`input[data-testid="amount"]`).value != null
    && this.document.querySelector(`input[data-testid="pct"]`).value != null) {
      console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)   
      const email = JSON.parse(localStorage.getItem("user")).email
      const fileInput = this.document.querySelector(`input[data-testid="file"]`)
      const file = fileInput.files[0]
      const fileName = this.filePath[this.filePath.length-1]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('email', email)
      formData.append('type', e.target.querySelector(`select[data-testid="expense-type"]`).value)
      formData.append('name', e.target.querySelector(`input[data-testid="expense-name"]`).value,)
      formData.append('amount', parseInt(e.target.querySelector(`input[data-testid="amount"]`).value))
      formData.append('date', e.target.querySelector(`input[data-testid="datepicker"]`).value)
      formData.append('vat', e.target.querySelector(`input[data-testid="vat"]`).value)
      formData.append('pct', parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20)
      formData.append('commentary', e.target.querySelector(`textarea[data-testid="commentary"]`).value)
      formData.append('fileUrl', this.fileUrl)
      formData.append('fileName', this.fileName)
      formData.append('status', 'pending')

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          console.log(fileUrl)
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
          this.onNavigate(ROUTES_PATH['Bills'])
        }).catch(error => console.error(error))      
    }
  }
}