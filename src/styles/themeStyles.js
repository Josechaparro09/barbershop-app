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
      // Contenedor principal
      wrapper: "min-w-full divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden",
      container: "overflow-x-auto shadow-md sm:rounded-lg",
      
      // Estilos de la tabla
      base: "min-w-full table-auto",
      bordered: "border border-gray-200 dark:border-gray-700",
      striped: "even:bg-gray-50 dark:even:bg-gray-700",
      
      // Encabezado
      thead: "bg-gray-50 dark:bg-gray-700",
      header: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none",
      headerCell: {
        base: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
        sortable: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
        sorted: "bg-gray-100 dark:bg-gray-600",
      },
      
      // Cuerpo
      tbody: "bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800",
      row: {
        base: "transition-colors duration-200",
        default: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
        selected: "bg-yellow-50 dark:bg-yellow-900/20",
        disabled: "opacity-50 cursor-not-allowed",
      },
      cell: {
        base: "px-6 py-4 whitespace-nowrap text-sm",
        default: "text-gray-900 dark:text-gray-300",
        truncate: "max-w-xs truncate",
        wrap: "whitespace-normal",
        alignLeft: "text-left",
        alignCenter: "text-center",
        alignRight: "text-right",
      },
      
      // Pie de tabla
      tfoot: "bg-gray-50 dark:bg-gray-700",
      footer: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
      
      // Estados especiales
      empty: {
        container: "text-center py-8",
        text: "text-gray-500 dark:text-gray-400",
      },
      loading: {
        overlay: "absolute inset-0 bg-white/50 dark:bg-gray-900/50",
        spinner: "absolute inset-0 flex items-center justify-center",
      },
      
      // Paginación
      pagination: {
        wrapper: "px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6",
        button: {
          base: "relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500",
          enabled: "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600",
          disabled: "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed",
        },
        text: "text-sm text-gray-700 dark:text-gray-300",
      },
      
      // Utilidades
      utils: {
        sortIcon: "ml-2 w-4 h-4",
        resizer: "absolute right-0 top-0 bottom-0 w-4 cursor-col-resize",
      },
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