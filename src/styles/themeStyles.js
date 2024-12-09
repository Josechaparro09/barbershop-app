// src/styles/themeStyles.js

export const themeStyles = {
    // Layouts y Contenedores Base
    layout: {
      main: "min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-gray-900",
      container: "container mx-auto px-4 py-8",
    },
  
    // Navegación
    nav: {
      wrapper: "bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-gray-800 dark:to-gray-900 shadow-lg",
      link: {
        base: "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active: "bg-indigo-700 dark:bg-gray-700 text-white",
        inactive: "text-indigo-100 hover:bg-indigo-500 dark:hover:bg-gray-700 hover:text-white"
      },
      mobileMenu: "fixed inset-0 bg-black bg-opacity-50 z-40",
    },
  
    // Tarjetas y Contenedores
    card: {
      base: "bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-colors duration-200",
      hover: "hover:bg-gray-50 dark:hover:bg-gray-700",
      header: "px-6 py-4 border-b border-gray-200 dark:border-gray-700",
      body: "p-6",
    },
  
    // Formularios
    form: {
      input: "appearance-none rounded-md relative block w-full px-3 py-2 border transition-colors duration-200 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700",
      select: "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
      label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
      checkbox: "h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 dark:border-gray-600 rounded",
      error: "text-sm text-red-600 dark:text-red-400 mt-1",
    },
  
    // Botones
    button: {
      primary: "inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200",
      secondary: "inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200",
      danger: "inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200",
      icon: "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
      disabled: "opacity-50 cursor-not-allowed",
    },
  
    // Tablas
    table: {
      wrapper: "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
      header: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
      row: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200",
      cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300",
      footer: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
    },
  
    // Estados y Badges
    status: {
      success: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400",
      warning: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400",
      error: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400",
      info: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400",
    },
  
    // Modales y Overlays
    modal: {
      overlay: "fixed inset-0 bg-black bg-opacity-50 z-40",
      container: "fixed inset-0 z-50 overflow-y-auto",
      content: "flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0",
      panel: "relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6",
    },
  
    // Texto
    text: {
      title: "text-2xl font-bold text-gray-900 dark:text-white",
      subtitle: "text-lg font-semibold text-gray-800 dark:text-gray-200",
      body: "text-gray-700 dark:text-gray-300",
      muted: "text-gray-500 dark:text-gray-400",
    },
  
    // Loading States
    loading: {
      spinner: "animate-spin rounded-full border-b-2 border-gray-900 dark:border-white h-8 w-8",
      wrapper: "flex justify-center items-center",
      overlay: "absolute inset-0 bg-white/50 dark:bg-gray-900/50",
    },
  
    // Dropdowns y Menús
    dropdown: {
      button: "inline-flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
      container: "absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none",
      item: "block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
      divider: "border-t border-gray-200 dark:border-gray-700 my-1",
    },
  
    // Utilidades
    utils: {
      divider: "border-t border-gray-200 dark:border-gray-700",
      shadow: "shadow-lg",
      rounded: "rounded-lg",
      transition: "transition-all duration-200",
    },
    
    
  };
  
  // Helper function para combinar clases
  export const combineClasses = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };
  
  // Ejemplo de uso:
  // import { themeStyles, combineClasses } from '../styles/themeStyles';
  // 
  // <button className={combineClasses(
  //   themeStyles.button.primary,
  //   disabled && themeStyles.button.disabled
  // )}>
  //   Botón
  // </button>