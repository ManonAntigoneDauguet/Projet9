/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I click on the send button", () => {
    test("Then I'm staying in the NewBill page", async() => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()
      await waitFor(() => screen.getByTestId('form-new-bill'))
      const formNewBill = screen.getByTestId('form-new-bill') 
      const newBillsScript = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage }) 

      const e = new Event("submit", { bubbles: true, cancelable: false })
      formNewBill.dispatchEvent(e)
      const handleSubmit = jest.fn(newBillsScript.handleSubmit(e))
      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill) 
      
      expect(handleSubmit).toHaveBeenCalled()
      await new Promise(process.nextTick)
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
  describe("When I am on NewBill Page, I fill the required input and I click on the send button", () => {
    test("Then it should renders Bills page", async() => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()
      await waitFor(() => screen.getByTestId('form-new-bill'))
      const formNewBill = screen.getByTestId('form-new-bill') 
      const newBillsScript = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage }) 

      const expenseTypeInput = screen.getByTestId('expense-type')
      expenseTypeInput.value = "Transport"
      const expenseNameInput = screen.getByTestId('expense-name')
      expenseNameInput.value = "TEST"
      const dateInput = screen.getByTestId('datepicker')
      dateInput.value = "2023-09-28"
      const amountInput = screen.getByTestId('amount')
      amountInput.value = "10"
      const pctInput = screen.getByTestId('pct')
      pctInput.value = "10"
      newBillsScript.filePath = "C:\\fakepath\\facture.png"

      const e = new Event("submit", { bubbles: true, cancelable: false })
      formNewBill.dispatchEvent(e)
      const handleSubmit = jest.fn(newBillsScript.handleSubmit(e))
      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill) 

      expect(handleSubmit).toHaveBeenCalled()
      await new Promise(process.nextTick)
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    })
  })
})
