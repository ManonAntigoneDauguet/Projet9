/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Actions from "../views/Actions.js"
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window') 
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", async() => {
      bills.forEach(bill => {
        bill.unformatedDate = bill.date
      })
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })  
  describe("When I am on Bill page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  describe("When I am on Bills page and I click on the new bill button", () => {
    test("Then it should renders Login page", async() => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const billsScript = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })

      document.body.innerHTML = BillsUI({ data: bills })
      const handleClickNewBill = jest.fn(() => {
        billsScript.handleClickNewBill()
      })

      await waitFor(() => screen.getByTestId('btn-new-bill'))
      const newBillButton = screen.getByTestId('btn-new-bill')       
      newBillButton.addEventListener('click', handleClickNewBill)
      fireEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
  describe("When I am on Bills page and I click on an icon eye", () => {
    test('Then, a modal should open', async() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsScript = new Bills({ document, onNavigate, store, localStorage: window.localStorage })

      const eye = document.createElement('div')
      eye.innerHTML = Actions()
      document.body.appendChild(eye)

      const handleClickIconEye = jest.fn(billsScript.handleClickIconEye(eye))

      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = await screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })
  })
})




// test d'intégration GET
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("fetches bills from mock API GET", async() => {
      document.body.innerHTML = BillsUI({ data: bills })
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentType = await screen.getByText("Services en ligne")
      expect(contentType).toBeTruthy()
      const contentStatus = await screen.getByText("accepted")
      expect(contentStatus).toBeTruthy()
      const contentDate = await screen.getByText("2003-03-03")
      expect(contentDate).toBeTruthy()
    })
  })
})
